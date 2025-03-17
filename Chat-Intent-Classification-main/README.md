# 1. 네이버 라이브 커머스 다시보기 방송의 채팅 데이터 수집

- 라이브 커머스 다시보기 방송에서 사용하는 채팅 요청 API 를 활용
**→ 약 15만개의 채팅 데이터 수집 (105개 방송)**
    

# 2. 채팅 데이터 의도 라벨링 수행

- 15만 채팅 데이터에 대해서 **일반(0), 질문(1), 요청(2)** 라벨링 수행
→ 일반 : 145,333개, 질문 : 6,595개, 요청 : 2,349개

# 3. 채팅 데이터 전처리

- 전체 데이터 대상으로 불용어 제거 → Python - Pandas 및 정규 표현식을 활용한 전처리 수행
    - E-Mail, URL, 한글 자음 및 모음, HTML 태그, 특수 기호, 문자 기호 (? 및 . 제외) 제거
    - 일반 채팅 데이터의 중복 데이터 → 중복 제거
    - 문자열 길이 2 이하(의미 없는)인 채팅 데이터 제거
    - 숫자만을 포함한 채팅 데이터 제거
        
- 전처리 후 잔여 채팅 데이터
→ 일반 : 47,449개, 질문 : 6,595개, 요청 : 2,349개

# 4. 채팅 의도 분류 수행 계획

## 3-Classes Classifier vs 2 개의 Binary Classfier

### 3-Classes Classifier

- 하나의 모델이 3가지 클래스(일반, 질문, 요청)를 동시에 분류하도록 학습합니다.
- 장점
    - 간단한 구조 : 단일 모델로 전체 문제를 해결하므로 구현이 간단하고 유지보수가 쉽습니다.
    - 효율성 : 모델 학습과 추론에서 한 번의 연산으로 모든 클래스를 처리합니다.
- 단점
    - 데이터 불균형에 민감 : 특정 클래스의 데이터가 부족하면, 전체 모델의 성능이 저하될 수 있습니다.
    - 복잡한 경계 학습의 어려움 : 클래스 간 경계가 비선형적이고 복잡한 경우, 단일 모델이 이를 학습하기 어렵습니다.

### 2 개의 Binary Classifier

- 2 개의 이진 분류 모델을 학습시켜 각 클래스 쌍을 독립적으로 분류합니다.
    - 전체 채팅 → 일반 vs 일반이 아닌(질문, 요청) 채팅 분류
    - 일반이 아닌(질문, 요청) 채팅 → 질문 vs 요청 분류
- 장점
    - 유연한 모델링 : 각 이진 분류 모델의 경계를 별도로 학습하므로, 클래스 간 경계가 복잡할 때 유리합니다.
    - 데이터 불균형 완화 : 특정 클래스와 나머지를 따로 학습하므로, 데이터 불균형 문제를 개별적으로 처리할 수 있습니다.
    - 모델 성능 분석 : 각 이진 분류 모델의 성능을 독립적으로 평가하고 조정할 수 있습니다.
- 단점
    - 추론 시간 증가 : 각 이진 분류 모델의 예측 결과를 결합해야 하므로, 다소 비효율적일 수 있습니다.
    - 복잡도 증가 : 이진 분류 모델을 2개 관리해야 하므로, 구현 및 유지보수가 복잡해질 수 있습니다.

## 채팅 의도 분류를 위해 2개의 Binary Classifier 모델 구축

- 이유 1 : 채팅 데이터에 대한 데이터 불균형이 존재한다.
    - 일반 : 47,449개, 질문 : 6,595개, 요청 : 2,349개 → 실제 데이터도 일반 채팅이 대다수일것
- 이유 2 : 클래스간의 경계가 선형 모델이 아니며 복잡하다.
    - 언어적 특성과 의도의 다의성을 반영해야 하므로, 클래스 간 경계가 상대적으로 모호한 특징을 갖는다.
- 이유 3 : 각 모델의 추론 시간이 1초 이내이다.
    - 이진 분류 모델을 채팅 데이터에 대해서 실행시켜보았을 때, 추론 시간이 매우 짧으므로, 추론 시간 증가에 대한 단점은 해결된다.

![image](https://github.com/user-attachments/assets/5ca4e057-c15b-4f91-95a9-b0dd98426388)

### 의도 분류 모델 1 - (일반, (질문 & 요청) 분류)

1. 사용 데이터
    - 일반 채팅 : 47,449 개, (질문 & 요청) 채팅 : 8,944개
2. Class Imbalanced 문제 해결
    - Random Sampling 방법 활용
    - 일반 채팅 : 47,449개 → 12,000 개 Under Sampling
    - (질문 & 요청) 채팅 : 8,944개 → 12,000개 Over Sampling
    - Python - Pandas 를 활용한 Random Sampling 수행
        
        ```python
        df = pd.read_csv('/content/drive/MyDrive/캡스톤/채팅 데이터/merge/processed_data.csv')
        
        df.loc[df['label'] == 2,'label'] = 1
        
        df0 = df[df['label']==0].sample(n = 12000)
        df1_sample = df[df['label']==1].sample(n = 4000)
        df1 = pd.concat([df[df['label'] == 1], df1_sample], ignore_index = True)
        ```
        
3. 모델 후보군 선택
    - 전체 데이터 중 학습 데이터 75%, 검증 데이터 25% 분류
        
        ```python
        df0_train, df0_val = train_test_split(df0, test_size=0.25, random_state=0)
        df0_train = df0_train[['message','label']]
        df0_val = df0_val[['message','label']]
        
        df1_train, df1_val = train_test_split(df1, test_size=0.25, random_state=0)
        df1_train = df1_train[['message','label']]
        df1_val = df1_val[['message','label']]
        
        dataset_train = pd.concat([df0_train, df1_train], ignore_index = True)
        dataset_val = pd.concat([df0_val, df1_val], ignore_index = True)
        
        tds = Dataset.from_pandas(dataset_train)
        vds = Dataset.from_pandas(dataset_val)
        
        datasets = DatasetDict()
        
        datasets['train'] = tds
        datasets['validation'] = vds
        ```
        
    - HuggingFace에 공유되어 있는 BERT 기반의 한국어 모델 12개를 이용하여 전이학습 수행
    → Base Parameter : batch_size = 12, learning_rate = 2e-5
  
        ![image](https://github.com/user-attachments/assets/aafccdfd-8adc-4091-9b58-a0fc4d69a135)
    
    - F-1 score 상위 5개의 후보 모델 선정
    → KcELECTRA-Base, KoELECTRA-Base, KLUE/BERT-base, KLUE/roBERTa-base, KoALBERT-Base
4. 후보 모델에 대한 하이퍼 파라미터 튜닝 수행 및 최종 모델 선택
    - batch_size 및 learning_rate 하이퍼 파라미터 튜닝 수행
        
        ```python
        metric_name = "f1"
        
        batchSize_list = [8, 16, 32, 64, 128]
        learningRate_list = [1e-7,1e-6,1e-5,1e-4,1e-3,2e-7,2e-6,2e-5,2e-4,2e-3]
        
        for batch_size in batchSize_list:
          for learning_rate in learningRate_list:
            args = TrainingArguments(
                "test-tc",
                evaluation_strategy="epoch",
                save_strategy="epoch",
                learning_rate=learning_rate,
                per_device_train_batch_size=batch_size,
                per_device_eval_batch_size=batch_size,
                num_train_epochs=5,
                weight_decay=0.01,
                load_best_model_at_end=True,
                metric_for_best_model=metric_name,
            )
        
            trainer = Trainer(
            model,
            args,
            train_dataset=encoded_datasets["train"],
            eval_dataset=encoded_datasets["validation"],
            tokenizer=tokenizer,
            compute_metrics=compute_metrics,
            )
        
            print(f"batch_size : {batch_size}, learning_rate : {learning_rate}")
            trainer.train()
        ```
        
    - 최종 선정 모델 : KcELECTRA-Base (batch_size = 8, learning_rate = 1e-05)
    F1 - score : 0.983608

### 의도 분류 모델 2 - (질문, 요청 분류)

1. 사용 데이터
    - 질문 채팅 : 6,595 개, 요청 채팅 : 2,349개
2. Class Imbalanced 문제 해결
    - Random Sampling 방법 활용
    - 질문 채팅 : 6,595개 → 3,000 개 Under Sampling
    - Python - Pandas 를 활용한 Random Sampling 수행
        
        ```python
        df = pd.read_csv('/content/drive/MyDrive/캡스톤/채팅 데이터/merge/processed_data.csv')
        
        df.loc[df['label']==1,'label'] = 0
        df.loc[df['label']==2,'label'] = 1
        
        df1 = df[df['label']==0].sample(n = 3000)
        df2 = df[df['label']==1]
        ```
        
3. 모델 후보군 선택
    - 전체 데이터 중 학습 데이터 75%, 검증 데이터 25% 분류
        
        ```python
        df1_train, df1_val = train_test_split(df1, test_size=0.25, random_state=10)
        df1_train = df1_train[['message','label']]
        df1_val = df1_val[['message','label']]
        
        df2_train, df2_val = train_test_split(df2, test_size=0.25, random_state=10)
        df2_train = df2_train[['message','label']]
        df2_val = df2_val[['message','label']]
        
        dataset_train = pd.concat([df1_train, df2_train], ignore_index = True)
        dataset_val = pd.concat([df1_val, df2_val], ignore_index = True)
        
        tds = Dataset.from_pandas(dataset_train)
        vds = Dataset.from_pandas(dataset_val)
        
        datasets = DatasetDict()
        
        datasets['train'] = tds
        datasets['validation'] = vds
        ```
        
    - HuggingFace에 공유되어 있는 BERT 기반의 한국어 모델 12개를 이용하여 전이학습 수행
    → Base Parameter : batch_size = 12, learning_rate = 2e-5
  
        ![image](https://github.com/user-attachments/assets/7afd8218-5ca2-4db2-bc86-c08e5b563cd7)
        
    - F-1 score 상위 5개의 후보 모델 선정
    → KCBERT-Base, KorBERT-Base, KcELECTRA-Base, KLUE/roBERTa-base, 
    KoALBERT-small
4. 후보 모델에 대한 하이퍼 파라미터 튜닝 수행 및 최종 모델 선택
    - batch_size 및 learning_rate 하이퍼 파라미터 튜닝 수행
        
        ```python
        metric_name = "f1"
        
        batchSize_list = [8, 16, 32, 64, 128]
        learningRate_list = [1e-7,1e-6,1e-5,1e-4,1e-3,2e-7,2e-6,2e-5,2e-4,2e-3]
        
        for batch_size in batchSize_list:
          for learning_rate in learningRate_list:
            args = TrainingArguments(
                "test-tc",
                evaluation_strategy="epoch",
                save_strategy="epoch",
                learning_rate=learning_rate,
                per_device_train_batch_size=batch_size,
                per_device_eval_batch_size=batch_size,
                num_train_epochs=5,
                weight_decay=0.01,
                load_best_model_at_end=True,
                metric_for_best_model=metric_name,
            )
        
            trainer = Trainer(
            model,
            args,
            train_dataset=encoded_datasets["train"],
            eval_dataset=encoded_datasets["validation"],
            tokenizer=tokenizer,
            compute_metrics=compute_metrics,
            )
        
            print(f"batch_size : {batch_size}, learning_rate : {learning_rate}")
            trainer.train()
        ```
        
    - 최종 선정 모델 : KcELECTRA-Base (batch_size = 8, learning_rate = 2e-05)
    F1 - score : 0.988414

## 최종 선정 모델

- 의도 분류 모델 1 - (일반, (질문 & 요청) 분류)
    - 최종 선정 모델 : KcELECTRA-Base (batch_size = 8, learning_rate = 1e-05)
    F1 - score : 0.983608
- 의도 분류 모델 2 - (질문, 요청 분류)
    - 최종 선정 모델 : KcELECTRA-Base (batch_size = 8, learning_rate = 2e-05)
    F1 - score : 0.988414

**KcELECTRA**

- 구어체, 신조어, 오탈자 등 공식적인 글쓰기에서 나타나지 않는 표현들이 빈번하게 등장하는 데이터셋을 이용하여 사전학습한 BERT 기반의 ELECTRA 모델
- 특히 KcELECTRA는 한국어 문장의 의미를 파악하고 다양한 자연어 처리 작업에 활용할 수 있음
